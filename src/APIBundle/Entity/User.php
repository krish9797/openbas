<?php

namespace APIBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity()
 * @ORM\Table(name="users", uniqueConstraints={@ORM\UniqueConstraint(name="users_email_unique",columns={"user_email"})})
 */
class User implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     */
    protected $user_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_firstname;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_lastname;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_email;

    /**
     * @ORM\Column(type="string")
     */
    protected $user_password;

    protected $user_plain_password;

    /**
     * @ORM\ManyToMany(targetEntity="Group", inversedBy="group_users")
     * @ORM\JoinTable(name="users_groups",
     *      joinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="user_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="group_id", referencedColumnName="group_id", onDelete="CASCADE")}
     *      )
     */
    protected $user_groups;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $user_admin = 0;

    /**
     * @ORM\Column(type="smallint")
     */
    protected $user_status = 1;

    public function __construct()
    {
        $this->user_groups = new ArrayCollection();
    }

    public function getUserId()
    {
        return $this->user_id;
    }

    public function setUserId($id)
    {
        $this->user_id = $id;
        return $this;
    }

    public function getUserFirstname()
    {
        return $this->user_firstname;
    }

    public function setUserFirstname($firstname)
    {
        $this->user_firstname = $firstname;
        return $this;
    }

    public function getUserLastname()
    {
        return $this->user_lastname;
    }

    public function setUserLastname($lastname)
    {
        $this->user_lastname = $lastname;
        return $this;
    }

    public function getUserEmail()
    {
        return $this->user_email;
    }

    public function setUserEmail($email)
    {
        $this->user_email = $email;
        return $this;
    }

    public function getUserPassword()
    {
        return $this->user_password;
    }

    public function setUserPassword($password)
    {
        $this->user_password = $password;
        return $this;
    }

    public function getUserPlainPassword()
    {
        return $this->user_plain_password;
    }

    public function setUserPlainPassword($password)
    {
        $this->user_plain_password = $password;
        return $this;
    }

    public function getUserGroups()
    {
        return $this->user_groups;
    }

    public function setUserGroups($groups)
    {
        $this->user_groups = $groups;
        return $this;
    }

    public function getUserAdmin()
    {
        return $this->user_admin;
    }

    public function setUserAdmin($admin)
    {
        $this->user_admin = $admin;
        return $this;
    }

    public function getUserStatus()
    {
        return $this->user_status;
    }

    public function setUserStatus($status)
    {
        $this->user_status = $status;
        return $this;
    }

    public function getRoles()
    {
        $roles = array();
        foreach( $this->user_groups as $group ) {
            foreach( $group->getGroupRoles() as $role ) {
                $roles[] = 'ROLE_' . $role->getRoleExercise()->getExerciseId() . '_' . $role->getRoleName();
            }
        }
        return $roles;
    }

    public function getSalt()
    {
        return null;
    }

    public function getUsername()
    {
        return $this->user_email;
    }

    public function getPassword()
    {
        return $this->user_password;
    }

    public function eraseCredentials()
    {
        $this->user_plain_password = null;
    }

    public function isAdmin() {
        return $this->user_admin;
    }
}