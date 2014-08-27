class Discipline < ActiveRecord::Base
  has_many :rounds, dependent: :destroy
end
