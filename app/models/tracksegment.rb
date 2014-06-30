class Tracksegment < ActiveRecord::Base
  belongs_to :track
  has_many :points, :dependent => :destroy
end
