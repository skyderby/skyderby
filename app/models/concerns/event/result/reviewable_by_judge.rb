class Event::Result < ApplicationRecord
  module ReviewableByJudge
    extend ActiveSupport::Concern

    def need_review?
      result.to_i.zero?
    end
  end
end
