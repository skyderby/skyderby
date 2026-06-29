class Badge < ApplicationRecord
  include Permissions

  enum :category, { competition: 0, online: 1, sponsor: 2, skyderby: 3, special: 4 }
  enum :kind, { gold: 0, silver: 1, bronze: 2 }

  belongs_to :profile

  validates :name, :category, presence: true

  after_initialize do
    self.achieved_at = Date.current
  end
end
