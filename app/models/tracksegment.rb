# == Schema Information
#
# Table name: tracksegments
#
#  id         :integer          not null, primary key
#  track_id   :integer
#  created_at :datetime
#  updated_at :datetime
#

class Tracksegment < ActiveRecord::Base
  belongs_to :track
  has_many :points

  before_destroy :delete_points

  private

  def delete_points
    Point.where(tracksegment_id: id).delete_all
  end
end
