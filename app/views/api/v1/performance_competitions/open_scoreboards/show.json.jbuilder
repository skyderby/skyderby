json.key_format! camelize: :lower

json.partial! 'api/v1/performance_competitions/scoreboard',
              scoreboard: @scoreboard, board: 'open', groups: [[nil, @scoreboard.standings]]
