class Tracksegment < ActiveRecord::Base
  belongs_to :track
  has_many :points

  before_destroy :delete_points

  private

  def delete_points
    Point.where(tracksegment_id: id).delete_all
  end
end
