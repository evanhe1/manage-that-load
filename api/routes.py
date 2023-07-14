from nba_api.stats.endpoints import playergamelog, teamgamelog, commonplayerinfo, teamdashboardbygeneralsplits
from nba_api.stats.static import players
from api import app
from flask import request, jsonify
from datetime import datetime, timedelta
import requests
import pandas as pd
import numpy as np
import json
from bs4 import BeautifulSoup
from pymongo import MongoClient

uri = "***REMOVED***"
client = MongoClient(uri)

db = client.nba.player_info

currentMonth = datetime.today().month
currentYear = datetime.today().year
leagueYear = currentYear if currentMonth >= 7 else currentYear-1
# @app.after_request
# def per_request_callbacks(response):
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#     return response

@app.route('/')
@app.route('/games')
def index():
    player_id = int(request.args['id'])
    query = {"player_id": player_id}
    document = db.find_one(query)
    if document:
        return jsonify(gamelog=document['gamelog'], gp=document['gp'], abr=document['abr'],
                       player_id=player_id)
    else:
        response = get_player_info(player_id)
        db.replace_one({"player_id": player_id}, json.loads(response.data))
        return response
    # response = Response(response=data, status=200, mimetype="application/json")
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # return response

def get_player_info(player_id):
    player_hist = generate_transaction_history(player_id)
    injuries_hist = generate_injury_history(player_id)

    player_info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    cur_team_id = player_info.get_data_frames()[0]["TEAM_ID"]
    df_team_abr = player_info.get_data_frames()[0]["TEAM_ABBREVIATION"]
    df_gp = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(team_id=cur_team_id).get_data_frames()[0]["GP"]
    df_team = build_df_team(player_hist, cur_team_id)

    player_games = playergamelog.PlayerGameLog(player_id=player_id)
    df_player = player_games.get_data_frames()[0]

    df_gl = df_team.merge(df_player["Game_ID"], indicator=True, how="left", on="Game_ID")
    df_gl["played"] = df_gl._merge != 'left_only'
    df_gl = df_gl.drop('_merge', axis=1)[["Game_ID", "GAME_DATE", "MATCHUP", "WL", "played"]]
    df_gl["miss_cause"] = None
    df_gl = annotate_player_games(injuries_hist, df_gl)
    response = jsonify(gamelog=df_gl.to_dict(orient="index"), gp=int(df_gp.to_string(index=False)), abr=df_team_abr.to_string(index=False),
                       player_id=player_id)
    return response

def generate_transaction_history(player_id):
    response = requests.get("https://stats.nba.com/js/data/playermovement/NBA_Player_Movement.json")
    transactions = response.json()['NBA_Player_Movement']['rows']
    df = pd.DataFrame.from_dict(transactions)
    df["PLAYER_ID"] = df["PLAYER_ID"].astype(np.int64)
    df["TEAM_ID"] = df["TEAM_ID"].astype(np.int64)
    df["Additional_Sort"] = df["Additional_Sort"].astype(np.int64)
    df = df[(df["PLAYER_ID"]==player_id) & (df["TRANSACTION_DATE"]>=f"{leagueYear}-10-01")][["Transaction_Type", "TRANSACTION_DATE", "TEAM_ID", "Additional_Sort"]][::-1]

    player_hist = []
    for _, t in df.iterrows():
        t_type = t["Transaction_Type"]
        t_team_1 = t["TEAM_ID"]
        t_team_2 = t["Additional_Sort"]
        t_date_str = t["TRANSACTION_DATE"][:10]
        t_date = datetime.strptime(t_date_str, "%Y-%m-%d")
        prev_date_str = str(t_date - timedelta(days=1))[:10]
        next_date_str = str(t_date + timedelta(days=1))[:10] # one day buffer before counting as game missed
        t_date_str = format_date(t_date_str)
        prev_date_str = format_date(prev_date_str)
        next_date_str = format_date(next_date_str)

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

    return player_hist


def build_df_team(player_hist, cur_team_id):
    df_team = pd.DataFrame()
    # reverse order so most recent team info comes first
    for stint in player_hist[::-1]:
        team_id = stint["team_id"]
        date_from = stint["date_from"]
        date_to = stint["date_to"]
        new_team = teamgamelog.TeamGameLog(team_id=team_id, date_from_nullable=date_from, date_to_nullable=date_to).get_data_frames()[0]
        df_team = pd.concat([df_team, new_team])
    if not player_hist:
        team_id = cur_team_id
        df_team = teamgamelog.TeamGameLog(team_id=team_id).get_data_frames()[0]
    return df_team

def format_date(date):
    # produce mm/dd/yyyy
    return date[5:7].lstrip('0') + '/' + date[8:].lstrip('0') + '/' + date[0:4]

def generate_injury_history(player_id):
    player_name = players.find_player_by_id(player_id)['full_name'].replace(" ", "+")
    url = f"https://www.prosportstransactions.com/basketball/Search/SearchResults.php?Player={player_name}&Team=&BeginDate=2022-07-01&EndDate=2023-06-30&ILChkBx=yes&InjuriesChkBx=yes&PersonalChkBx=yes&DisciplinaryChkBx=yes&Submit=Search"
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
        injuries_hist[-1]["date_to"] = f"{leagueYear+1}-07-01"
    return injuries_hist

def annotate_player_games(injuries_hist, df_gl):
    # GAME_DATE was originally of type object, need to convert to type datetime
    for injury in injuries_hist:
        date_from = pd.to_datetime(injury["date_from"])
        date_to = pd.to_datetime(injury["date_to"])
        df_gl.loc[(pd.to_datetime(df_gl['GAME_DATE'], format='%b %d, %Y') >= date_from) & (pd.to_datetime(df_gl['GAME_DATE'], format='%b %d, %Y') < date_to), 'miss_cause'] = injury["cause"]
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
    db.delete_many({})
    player_list = players.get_active_players()
    for player in player_list:
        player_id = player["id"]
        print(player["full_name"])
        response = get_player_info(player_id)
        data = json.loads(response.data)
        data["player_id"] = player_id
        db.insert_one(data)

