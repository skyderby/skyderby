# == Schema Information
#
# Table name: wingsuits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(510)
#  kind               :integer          default(0)
#  photo_file_name    :string(510)
#  photo_content_type :string(510)
#  photo_file_size    :integer
#  photo_updated_at   :datetime
#  description        :text
#

FactoryGirl.define do
  factory :wingsuit, aliases: [:suit] do
    name 'Ghost 3'
    manufacturer

    factory :tracksuit do
      kind :tracksuit
    end
  end
end
