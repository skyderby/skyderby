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

FactoryGirl.define do
  factory :profile, aliases: [:responsible, :pilot] do
    sequence(:name) { |n| "pilot#{n}" }
  end
end
