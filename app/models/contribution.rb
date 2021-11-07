class Contribution < ApplicationRecord
  has_many :details, dependent: :destroy
end
