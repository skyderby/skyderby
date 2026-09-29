json.key_format! camelize: :lower

json.partial! 'api/v1/performance_competitions/scoreboard',
              scoreboard: @scoreboard, board: 'task', task: @scoreboard.task, groups: [[nil, @scoreboard.standings]]
