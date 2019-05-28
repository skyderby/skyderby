class Event::Result < ApplicationRecord
  module SubmissionAuthor
    extend ActiveSupport::Concern

    included do
      belongs_to :uploaded_by, class_name: 'Profile', foreign_key: 'profile_id', inverse_of: false

      before_save :set_uploaded_by
    end

    def set_uploaded_by
      self.uploaded_by ||= Current.profile
    end
  end
end
