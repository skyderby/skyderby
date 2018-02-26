module Ownerable
  extend ActiveSupport::Concern

  included do
    belongs_to :owner, polymorphic: true, optional: true
  end

  def belongs_to_user?
    owner_type == 'User'
  end

  def belongs_to_event?
    owner_type == 'Event'
  end

  def belongs_to_tournament?
    owner_type == 'Tournament'
  end
end
