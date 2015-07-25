# == Schema Information
#
# Table name: event_sponsors
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  logo_file_name    :string(255)
#  logo_content_type :string(255)
#  logo_file_size    :integer
#  logo_updated_at   :datetime
#  website           :string(255)
#  event_id          :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

class EventSponsor < ActiveRecord::Base
  belongs_to :event
  has_attached_file :logo, styles: { medium: '300x120>' }
  validates_attachment_content_type :logo, content_type: %r{\Aimage\/.*\Z}
end
