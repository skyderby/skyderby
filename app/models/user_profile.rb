class UserProfile < ActiveRecord::Base
  belongs_to :user

  before_save :set_name

  has_attached_file :userpic, :styles => { :medium => '300x300>', :thumb => '100x100#' },
                    :default_url => '/images/:style/missing.png'

  validates_attachment_content_type :userpic, :content_type => /\Aimage\/.*\Z/

  private

  def set_name
    self.name = self.last_name + ' ' + self.first_name
  end

end
