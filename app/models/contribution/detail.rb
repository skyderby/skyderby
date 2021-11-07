class Contribution::Detail < ApplicationRecord
  belongs_to :contribution
  belongs_to :contributor, polymorphic: true
end
