class Badge < ActiveRecord::Base
  enum kind: [:gold, :silver, :bronze]

  belongs_to :user_profile
end
