class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer
  belongs_to :ws_class
end
