class Badge < ActiveRecord::Base
  belongs_to :user_profile
  enum kind: [:gold, :silver, :bronze]
end
