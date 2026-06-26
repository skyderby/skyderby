# == Schema Information
#
# Table name: profile_aliases
#
#  id         :bigint           not null, primary key
#  name       :string(510)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  profile_id :bigint           not null
#

class Profile < ApplicationRecord
  class Alias < ApplicationRecord
    self.table_name = 'profile_aliases'

    belongs_to :profile, inverse_of: :aliases

    validates :name, presence: true
  end
end
