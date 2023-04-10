from nba_api.stats.endpoints import playergamelog, teamgamelog, commonplayerinfo
from nba_api.stats.static import players
from api import app
from flask import request
from datetime import datetime, timedelta
import requests
import pandas as pd
import numpy as np

currentMonth = datetime.today().month
currentYear = datetime.today().year
leagueYear = currentYear if currentMonth >= 7 else currentYear-1
# @app.after_request
# def per_request_callbacks(response):
#     response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
#     return response

@app.route('/')
@app.route('/search')
def index():
    player_id= int(request.args['id'])
    
    player_hist = generate_transaction_history(player_id)

    df_team = build_df_team(player_hist, player_id)
    
    playerGames = playergamelog.PlayerGameLog(player_id=player_id)
    df_player = playerGames.get_data_frames()[0]

    df_gp = df_team.merge(df_player["Game_ID"], indicator=True, how="left", on="Game_ID")
    df_gp["played"] = df_gp._merge != 'left_only'
    df_gp = df_gp.drop('_merge', axis = 1)[["Game_ID", "GAME_DATE", "MATCHUP", "WL", "played"]]
    return df_gp.to_json(orient="index")
    #response = Response(response=data, status=200, mimetype="application/json")
    #response.headers.add('Access-Control-Allow-Origin', '*')
    #return response
    
@app.route("/players")
def find_players():
    player_name = request.args['name']
    players_data = players.find_players_by_full_name(player_name)
    return [(player['id'], player['full_name']) for player in players_data if player["is_active"]]

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
        t_date_str = format_date(t_date_str)
        prev_date_str = format_date(prev_date_str)

        if t_type == "Signing":
            player_hist.append({"team_id": t_team_1, "date_from": t_date_str, "date_to": None})
        elif t_type == "Trade":
            if player_hist:
                player_hist[-1]["date_to"] = prev_date_str
            else:
                player_hist.append({"team_id": t_team_2, "date_from": None, "date_to": prev_date_str})
            player_hist.append({"team_id": t_team_1, "date_from": t_date_str, "date_to": None})
        elif t_type == "Waive":
            if player_hist:
                player_hist[-1]["date_to"] = prev_date_str
            else:
                player_hist.append({"team_id": t_team_1, "date_from": None, "date_to": prev_date_str})
    
    return player_hist

def build_df_team(player_hist, player_id):
    df_team = pd.DataFrame()
    for stint in player_hist:
        team_id = stint["team_id"]
        date_from = stint["date_from"]
        date_to = stint["date_to"]
        new_team = teamgamelog.TeamGameLog(team_id=team_id, date_from_nullable=date_from, date_to_nullable=date_to).get_data_frames()[0]
        df_team = pd.concat([df_team, new_team])
    if not player_hist:
        team_id = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_data_frames()[0]["TEAM_ID"]
        df_team =  teamgamelog.TeamGameLog(team_id=team_id).get_data_frames()[0]
    return df_team

def format_date(date):
    # produce mm/dd/yyyy
    return date[5:7].lstrip('0') + '/' + date[8:].lstrip('0') + '/' + date[0:4]