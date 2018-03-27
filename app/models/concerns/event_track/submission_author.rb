 class EventTrack
   module SubmissionAuthor
     extend ActiveSupport::Concern

     included do
       attr_accessor :current_user

       belongs_to :uploaded_by, class_name: 'Profile', foreign_key: 'profile_id'

       before_save :set_uploaded_by
     end

     def set_uploaded_by
       self.uploaded_by ||= current_user.profile if current_user
     end
   end
 end
