class Contribution::Detail < ApplicationRecord
  belongs_to :contribution
  belongs_to :profile
end
