class QualificationRound < ActiveRecord::Base
  belongs_to :tournament
  has_many :qualification_jumps
end
