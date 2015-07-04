# == Schema Information
#
# Table name: user_profiles
#
#  id                   :integer          not null, primary key
#  last_name            :string(255)
#  first_name           :string(255)
#  name                 :string(255)
#  userpic_file_name    :string(255)
#  userpic_content_type :string(255)
#  userpic_file_size    :integer
#  userpic_updated_at   :datetime
#  user_id              :integer
#  facebook_profile     :string(255)
#  vk_profile           :string(255)
#  dropzone_id          :integer
#  crop_x               :integer
#  crop_y               :integer
#  crop_w               :integer
#  crop_h               :integer
#  default_units        :integer          default(0)
#  default_chart_view   :integer          default(0)
#

FactoryGirl.define do
  factory :user_profile, aliases: [:responsible, :pilot] do
    sequence(:name) { |n| "pilot#{n}" }
  end
end
