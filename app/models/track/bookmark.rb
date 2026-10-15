class Track::Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :track

  validates :track_id, uniqueness: { scope: :user_id }
end
