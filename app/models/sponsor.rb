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

class Sponsor < ActiveRecord::Base
  belongs_to :sponsorable, polymorphic: true

  validates_presence_of :name, :website
  validates :logo, attachment_presence: true

  has_attached_file :logo, styles: { medium: '300x120>' }
  validates_attachment_content_type :logo, content_type: %r{\Aimage\/.*\Z}
end
