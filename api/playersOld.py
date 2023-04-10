from nba_api.stats.endpoints import leaguegamelog, boxscoretraditionalv2
from datetime import date, timedelta
from api import app

games = leaguegamelog.LeagueGameLog()
df_games = games.get_data_frames()[0]
today = str(date.today()-timedelta(days = 1))

df_games = df_games[df_games["GAME_DATE"]==today]["GAME_ID"]
print(df_games)
for game_id in set(df_games):
    boxscore = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
    df_boxscore = boxscore.get_data_frames()[0]
    print(df_boxscore[["PLAYER_NAME", "MIN"]])

