class User < ActiveRecord::Base

  has_many :user_wingsuits, :dependent => :destroy
  has_many :wingsuits, :through => :user_wingsuits

  has_many :tracks, :dependent => :destroy

  has_many :competitors
  has_many :events, :through => :competitors

  has_many :assignments
  has_many :roles, :through => :assignments

  before_save :set_name

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_attached_file :userpic, :styles => { :medium => "300x300>", :thumb => "100x100#" },
                    :default_url => "/images/:style/missing.png"

  validates_attachment_content_type :userpic, :content_type => /\Aimage\/.*\Z/

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

  def self.search_by_name query
    User.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
  end

  private
    def set_name
      self.name = last_name + ' ' + first_name
    end
end
