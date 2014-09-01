class Event < ActiveRecord::Base
  has_many :event_tracks, through: :rounds
  has_many :users, through: :competitors
  has_many :organizers
  has_many :competitors
  has_many :rounds
  has_many :participation_forms
  has_many :invitations
  has_many :event_documents
end
