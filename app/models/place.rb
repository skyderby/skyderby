class Place < ActiveRecord::Base
  belongs_to :country
  has_many :tracks
end
