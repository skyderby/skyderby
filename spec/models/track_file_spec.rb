# == Schema Information
#
# Table name: track_files
#
#  id                :integer          not null, primary key
#  file_file_name    :string(510)
#  file_content_type :string(510)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#

require 'rails_helper'

RSpec.describe TrackFile, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
