# == Schema Information
#
# Table name: profiles
#
#  id                   :integer          not null, primary key
#  last_name            :string(510)
#  first_name           :string(510)
#  name                 :string(510)
#  userpic_file_name    :string(510)
#  userpic_content_type :string(510)
#  userpic_file_size    :integer
#  userpic_updated_at   :datetime
#  user_id              :integer
#  facebook_profile     :string(510)
#  vk_profile           :string(510)
#  dropzone_id          :integer
#  crop_x               :integer
#  crop_y               :integer
#  crop_w               :integer
#  crop_h               :integer
#  default_units        :integer          default("metric")
#  default_chart_view   :integer          default("multi")
#  country_id           :integer
#

require 'spec_helper'

describe Profile, type: :model do
  describe '#cropping?' do
    it 'true if all attrs present' do
      profile = Profile.new(crop_x: 1, crop_y: 1, crop_h: 1, crop_w: 1)
      expect(profile.cropping?).to be_truthy
    end

    it 'false if none attr present' do
      profile = Profile.new
      expect(profile.cropping?).to be_falsey
    end

    it 'false if any attr is not present' do
      profile = Profile.new(crop_x: 1, crop_y: 1, crop_h: 1)
      expect(profile.cropping?).to be_falsey
    end
  end
end
