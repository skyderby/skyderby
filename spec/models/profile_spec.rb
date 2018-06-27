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
#  default_units        :integer          default("metric")
#  default_chart_view   :integer          default("multi")
#  country_id           :integer
#  owner_type           :string
#  owner_id             :integer
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

  describe '#belongs_to_user?' do
    it 'true if belongs to user' do
      user = create :user
      expect(user.profile.belongs_to_user?).to be_truthy
    end
  end

  describe '#belongs_to_event?' do
    it 'true if belongs to event' do
      event = create :event
      profile = create :profile, owner: event
      expect(profile.belongs_to_event?).to be_truthy
    end
  end

  describe '#belongs_to_tournament?' do
    it 'true if belongs to tournament' do
      tournament = tournaments(:world_base_race)
      profile = create :profile, owner: tournament
      expect(profile.belongs_to_tournament?).to be_truthy
    end
  end
end
