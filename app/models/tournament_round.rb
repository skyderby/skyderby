class TournamentRound < ActiveRecord::Base
  belongs_to :tournament
  has_many :tournament_matches
end
