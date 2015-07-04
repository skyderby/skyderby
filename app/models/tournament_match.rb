class TournamentMatch < ActiveRecord::Base
  belongs_to :round,
             class_name: 'TournamentRound',
             foreign_key: 'tournament_round_id'
  has_many :tournament_match_competitors
end
