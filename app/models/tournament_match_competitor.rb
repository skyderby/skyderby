class TournamentMatchCompetitor < ActiveRecord::Base
  belongs_to :tournament_match
  belongs_to :tournament_competitor
  belongs_to :track
end
