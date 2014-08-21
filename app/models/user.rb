class User < ActiveRecord::Base

  has_many :tracks, :dependent => :destroy

  has_many :assignments
  has_many :roles, :through => :assignments

  before_save :set_name

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

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
