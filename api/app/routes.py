from nba_api.stats.endpoints import playergamelog, teamgamelog, commonplayerinfo, teamdashboardbygeneralsplits, playerprofilev2
from nba_api.stats.static import players, teams
from nba_api.stats.library.parameters import SeasonAll, Season
from . import app
from flask import request, jsonify, Response
from datetime import datetime, timedelta
import requests
import pandas as pd
import numpy as np
import json
import os
import sys
from bs4 import BeautifulSoup
from pymongo import MongoClient
from flask_apscheduler import APScheduler

uri = os.environ.get("MONGO_URI")
client = MongoClient(uri)

db = client.nba.player_info

currentMonth = datetime.today().month
currentYear = datetime.today().year
maxYear = currentYear-1 if currentMonth <= 10 else currentYear

# @app.after_request
# def per_request_callbacks(response):
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#     return response

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

team_ids = [team['id'] for team in teams.get_teams()]
df_team_gamelogs = {}
for id in team_ids:
    cur_gamelogs = teamgamelog.TeamGameLog(team_id=id, season=SeasonAll.all,
                                           date_from_nullable='10/25/2003').get_data_frames()[0]
    cur_gamelogs['Date_idx'] = pd.to_datetime(cur_gamelogs['GAME_DATE'], format='%b %d, %Y').dt.strftime('%Y-%m-%d')
    df_team_gamelogs[id] = {}
    for year in range(2003, maxYear+1):
        df_team_gamelogs[id][year] = cur_gamelogs[(cur_gamelogs['Date_idx'] >= f'{year}-10-01') &
                                            (cur_gamelogs['Date_idx'] <= f'{year + 1}-09-30')]

def update_helper():
    player_list = players.get_active_players()
    for player in player_list:
        print(player["full_name"])
        player_id = player["id"]
        try:
            response = get_player_info(player_id)
            if not response:
                continue
            db.replace_one({"player_id": player_id}, json.loads(response.data))
        except Exception as e:
            print(e, file=sys.stderr)

@scheduler.task('cron', id='update_db_midnight', hour=0, timezone='US/Pacific')
@scheduler.task('cron', id='update_db_noon', hour=12, timezone='US/Pacific')
def auto_update():
    with scheduler.app.app_context():
        update_helper()

@app.route('/')
@app.route('/games')
def index():
    player_id = int(request.args['id'])
    query = {"player_id": player_id}
    document = db.find_one(query)
    if document:
        document_dict = json.loads(json.dumps(document, default=str))
        return jsonify(document_dict)
    else:
        response = get_player_info(player_id)
        db.replace_one({"player_id": player_id}, json.loads(response.data))
        return response
    # response = Response(response=data, status=200, mimetype="application/json")
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # return response

def get_player_info(player_id):
    data = {}
    df_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]
    df_profile = playerprofilev2.PlayerProfileV2(player_id=player_id).get_data_frames()[0]
    season_to_team = {df_profile["SEASON_ID"][i]: {"TEAM_ID": str(df_profile["TEAM_ID"][i]), "TEAM_ABBREVIATION": str(df_profile["TEAM_ABBREVIATION"][i])} for i in df_profile["SEASON_ID"].keys() if str(df_profile["TEAM_ABBREVIATION"][i]) != 'TOT'}
    first_played_season = list(season_to_team.keys())[0] if season_to_team.keys() else None
    # cur_season = int(df_info["FROM_YEAR"].iloc[0])
    # while f"{cur_season}-{int(str(cur_season)[2:])+1:02}" not in season_to_team and cur_season < currentYear:
    #     season_id = f"{cur_season}-{int(str(cur_season)[2:])+1:02}"
    #     if first_played_season:
    #         season_to_team[season_id] = {"TEAM_ID": season_to_team[first_played_season]["TEAM_ID"], "TEAM_ABBREVIATION": season_to_team[first_played_season]["TEAM_ABBREVIATION"]}
    #     else:
    #         season_to_team[season_id] = {"TEAM_ID": df_info["TEAM_ID"].iloc[0], "TEAM_ABBREVIATION": df_info["TEAM_ABBREVIATION"].iloc[0]}
    #     cur_season+=1
    player_games = playergamelog.PlayerGameLog(player_id=player_id, season=SeasonAll.all)
    df_player = player_games.get_data_frames()[0]
    for season in sorted(season_to_team.keys()):
        print(season)
        league_year = int(season[:4])

        player_hist = generate_transaction_history(player_id, season)
        injuries_hist = generate_injury_history(player_id, league_year)

        cur_team_id = season_to_team[season]["TEAM_ID"]
        cur_team_abr = season_to_team[season]["TEAM_ABBREVIATION"]

        df_team = build_df_team(player_hist, int(cur_team_id), season)

        df_gl = df_team.merge(df_player["Game_ID"], indicator=True, how="left", on="Game_ID")
        df_gl["played"] = df_gl._merge != 'left_only'
        df_gl = df_gl.drop('_merge', axis=1)[["Game_ID", "GAME_DATE", "MATCHUP", "WL", "played"]]
        df_gl["miss_cause"] = None
        df_gl = annotate_player_games(injuries_hist, df_gl)
        data[season] = {}
        data[season]['gamelog'] = df_gl.to_dict(orient="index")
        data[season]['abr'] = cur_team_abr
        if league_year == currentYear-1 and currentMonth <= 4 or league_year == currentYear and currentMonth >= 10:
            df_gp = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(team_id=cur_team_id, season=season).get_data_frames()[0]["GP"]
            data[season]['gp'] = int(df_gp.to_string(index=False))
    data['player_id'] = player_id
    response = jsonify(data)
    return response

def generate_transaction_history(player_id, season):
    response = requests.get("https://stats.nba.com/js/data/playermovement/NBA_Player_Movement.json")
    transactions = response.json()['NBA_Player_Movement']['rows']
    df = pd.DataFrame.from_dict(transactions)
    df["PLAYER_ID"] = df["PLAYER_ID"].astype(np.int64)
    df["TEAM_ID"] = df["TEAM_ID"].astype(np.int64)
    df["Additional_Sort"] = df["Additional_Sort"].astype(np.int64)
    league_year = int(season[:4])
    df = df[(df["PLAYER_ID"]==player_id) & (df["TRANSACTION_DATE"]>=f"{league_year}-07-01") & (df["TRANSACTION_DATE"]<=f"{league_year+1}-06-30")][["Transaction_Type", "TRANSACTION_DATE", "TRANSACTION_DESCRIPTION", "TEAM_ID", "Additional_Sort"]][::-1]

    player_hist = []
    for _, t in df.iterrows():
        t_type = t["Transaction_Type"]
        t_team_1 = t["TEAM_ID"]
        t_team_2 = t["Additional_Sort"]
        t_date_str = t["TRANSACTION_DATE"][:10]
        t_desc = t["TRANSACTION_DESCRIPTION"]
        if "re-signed" in t_desc:
            continue
        t_date = datetime.strptime(t_date_str, "%Y-%m-%d")
        prev_date_str = str(t_date - timedelta(days=1))[:10]
        next_date_str = str(t_date + timedelta(days=1))[:10] # one day buffer before counting as game missed
        t_date_str = format_date(t_date_str)
        # prev_date_str = format_date(prev_date_str)
        # next_date_str = format_date(next_date_str)

        if t_type == "Signing":
            player_hist.append({"team_id": t_team_1, "date_from": next_date_str, "date_to": None})
        elif t_type == "Trade":
            if player_hist:
                player_hist[-1]["date_to"] = prev_date_str
            else:
                player_hist.append({"team_id": t_team_2, "date_from": None, "date_to": prev_date_str})
            player_hist.append({"team_id": t_team_1, "date_from": next_date_str, "date_to": None})
        elif t_type == "Waive":
            if player_hist:
                player_hist[-1]["date_to"] = prev_date_str
            else:
                player_hist.append({"team_id": t_team_1, "date_from": None, "date_to": prev_date_str})

    if player_hist and player_hist[-1]["date_to"] is None:
        player_hist[-1]["date_to"] = f"{league_year+1}-07-01"
    return player_hist


def build_df_team(player_hist, team_id, season):
    df_team = pd.DataFrame()
    league_year = int(season[:4])
    # reverse order so most recent team info comes first
    if player_hist:
        for stint in player_hist[::-1]:
            team_id = stint["team_id"]
            date_from = stint["date_from"]
            date_to = stint["date_to"]
            new_team = df_team_gamelogs[team_id][league_year][(df_team_gamelogs[team_id][league_year]['Date_idx'] >= date_from) & (df_team_gamelogs[team_id][league_year]['Date_idx'] <= date_to)]
            # new_team = teamgamelog.TeamGameLog(team_id=team_id, season=season, date_from_nullable=date_from, date_to_nullable=date_to).get_data_frames()[0]
            df_team = pd.concat([df_team, new_team])
    else:
        df_team = df_team_gamelogs[team_id][league_year]
        #df_team = teamgamelog.TeamGameLog(team_id=cur_team_id, season=str(season)).get_data_frames()[0]
    return df_team

def format_date(date):
    # produce mm/dd/yyyy
    return date[5:7].lstrip('0') + '/' + date[8:].lstrip('0') + '/' + date[0:4]

def generate_injury_history(player_id, league_year):
    player_name = players.find_player_by_id(player_id)['full_name'].replace(" ", "+")
    url = f"https://www.prosportstransactions.com/basketball/Search/SearchResults.php?Player={player_name}&Team=&BeginDate={league_year}-07-01&EndDate={league_year+1}-06-30&ILChkBx=yes&InjuriesChkBx=yes&PersonalChkBx=yes&DisciplinaryChkBx=yes&Submit=Search"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    rows = soup.find_all("tr")
    injuries = []
    # skip header and last empty padding row
    for row in rows[1:-1]:
        trs = row.find_all('td')
        if len(trs) >= 5:
            date, info = trs[0], trs[4]
            if info:
                injuries.append({"date": date.text, "info": info.text.strip()})

    injuries_hist = []
    for injury in injuries:
        # either this is first item or previous item is a completed interval
        if injury["info"].startswith("placed on IL") and (not injuries_hist or injuries_hist and injuries_hist[-1]["date_to"]):
            info = injury["info"].replace("placed on IL with ", "")
            injuries_hist.append({"date_from": injury["date"], "date_to": None, "cause": info})
        elif injury["info"].startswith("suspended") and (not injuries_hist or injuries_hist and injuries_hist[-1]["date_to"]):
            injuries_hist.append({"date_from": injury["date"], "date_to": None, "cause": "suspension"})
        # make sure there is an event to add an end date to
        elif injury["info"].startswith("activated from IL") and injuries_hist:
            injuries_hist[-1]["date_to"] = injury["date"]
        elif injury["info"].startswith("reinstated from suspension") and injuries_hist:
            injuries_hist[-1]["date_to"] = injury["date"]

    if injuries_hist and injuries_hist[-1]["date_to"] is None:
        injuries_hist[-1]["date_to"] = f"{league_year+1}-07-01"
    return injuries_hist

def annotate_player_games(injuries_hist, df_gl):
    # GAME_DATE was originally of type object, need to convert to type datetime
    for injury in injuries_hist:
        date_from = pd.to_datetime(injury["date_from"])
        date_to = pd.to_datetime(injury["date_to"])
        df_gl.loc[(pd.to_datetime(df_gl['GAME_DATE'], format='%b %d, %Y') >= date_from) & (pd.to_datetime(df_gl['GAME_DATE'], format='%b %d, %Y') <= date_to), 'miss_cause'] = injury["cause"]
    return df_gl
@app.route("/search")
def search():
    player_name = request.args['name']
    players_data = players.find_players_by_full_name(player_name)
    return [(player['id'], player['full_name']) for player in players_data if player["is_active"]]

@app.route("/gp")
def info():
    player_id = int(request.args['id'])
    team_id = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]["TEAM_ID"]
    team_gp = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(team_id=team_id).get_data_frames()[0]["GP"]

    return team_gp.json()

@app.route("/update")
def update():
    update_helper()
    return Response(status=200)

@app.route("/test")
def test():
    df = commonplayerinfo.CommonPlayerInfo(player_id=1631096).get_data_frames()[0]
    #season_to_team = {df["SEASON_ID"][i]: {"TEAM_ID": str(df["TEAM_ID"][i]), "TEAM_ABBREVIATION": str(df["TEAM_ABBREVIATION"][i])} for i in df["SEASON_ID"].keys()}
    #print(season_to_team)
    return jsonify(df.to_dict())

@app.route("/update_single")
def update_single():
    player_id = int(request.args['id'])
    response = get_player_info(player_id)
    db.replace_one({"player_id": player_id}, json.loads(response.data))
    return Response(status=200)


