class Sponsor < ApplicationRecord
  include LogoUploader::Attachment(:logo)

  after_validation { logo_derivatives! if logo_changed? }

  belongs_to :sponsorable, polymorphic: true, touch: true

  validates :name, :website, :logo, presence: true
end
