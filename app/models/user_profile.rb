class UserProfile < ActiveRecord::Base
  belongs_to :user

  before_save :set_name

  has_attached_file :userpic,
                    styles: { medium: '300x300>', thumb: '100x100#' },
                    default_url: '/images/:style/missing.png'

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']

  private

  def set_name
    self.name ||= last_name + ' ' + first_name
  end
end
