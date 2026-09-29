json.key_format! camelize: :lower

json.partial! 'api/v1/speed_skydiving_competitions/scoreboard',
              scoreboard: @scoreboard,
              board: 'main',
              groups: @scoreboard.categories.map { |data| [data[:category], data[:standings]] }
