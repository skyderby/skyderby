# == Schema Information
#
# Table name: sponsors
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  logo_file_name    :string(510)
#  logo_content_type :string(510)
#  logo_file_size    :integer
#  logo_updated_at   :datetime
#  website           :string(510)
#  sponsorable_id    :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  sponsorable_type  :string
#

class Sponsor < ApplicationRecord
  include LogoUploader::Attachment(:logo)
  after_validation { logo_derivatives! if logo_changed? }

  belongs_to :sponsorable, polymorphic: true, touch: true

  validates :name, :website, :logo, presence: true
end
