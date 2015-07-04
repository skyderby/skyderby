class TournamentCompetitor < ActiveRecord::Base
  belongs_to :tournament
  belongs_to :user_profile
  belongs_to :wingsuit

  delegate :name, to: :user_profile
end
