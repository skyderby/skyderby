# == Schema Information
#
# Table name: tournament_match_competitors
#
#  id                       :integer          not null, primary key
#  result                   :decimal(10, 3)
#  tournament_competitor_id :integer
#  tournament_match_id      :integer
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#

class TournamentMatchCompetitor < ActiveRecord::Base
  belongs_to :tournament_competitor
  belongs_to :tournament_match
  belongs_to :track
end
