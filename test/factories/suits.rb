# == Schema Information
#
# Table name: suits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(510)
#  kind               :integer          default("wingsuit")
#  photo_file_name    :string(510)
#  photo_content_type :string(510)
#  photo_file_size    :integer
#  photo_updated_at   :datetime
#  description        :text
#

FactoryBot.define do
  factory :suit do
    sequence(:name) { |n| "Suit-#{n}" }
    manufacturer

    factory :tracksuit do
      kind { :tracksuit }
    end
  end
end
