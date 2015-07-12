# == Schema Information
#
# Table name: wingsuits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(255)
#  kind               :integer          default(0)
#  photo_file_name    :string(255)
#  photo_content_type :string(255)
#  photo_file_size    :integer
#  photo_updated_at   :datetime
#  description        :text(65535)
#

FactoryGirl.define do
  factory :wingsuit do
    name 'Ghost 3'
    manufacturer
  end
end
