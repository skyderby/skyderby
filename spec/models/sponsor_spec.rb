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

require 'rails_helper'

RSpec.describe Sponsor, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
