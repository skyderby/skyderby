class EventDocument < ActiveRecord::Base
  belongs_to :event

  has_attached_file :attached_file
  validates :attached_file, :attachment_presence => true
  validates_with AttachmentSizeValidator, :attributes => :attached_file, :less_than => 5.megabytes
  # validates_attachment_content_type :attached_file, :content_type => {
  #     :image => ['image/jpg','image/jpeg','image/pjpeg','image/png','image/x-png','image/gif'],
  #     :pdf => ['application/pdf'],
  #     :word => ['application/msword','applicationvnd.ms-word','applicaiton/vnd.openxmlformats-officedocument.wordprocessingm1.document'],
  #     :excel => ['application/msexcel','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  #     :powerpoint => ['application/mspowerpoint','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  #     :text => ['text/plain']
  #   }

end
