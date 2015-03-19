class UserProfile < ActiveRecord::Base
  belongs_to :user
  has_many :tracks

  has_attached_file :userpic,
                    styles: { large: '500x500>',
                              medium: '150x150#',
                              thumb: '32x32#' },
                    default_url: '/images/:style/missing.png'

  validates_attachment_content_type :userpic, content_type:
    ['image/jpeg', 'image/jpg', 'image/png']
end
