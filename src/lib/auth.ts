import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { User, UserProfile, Address } from './firestore-types'

export class AuthService {
  // ============= POMOCNICZA FUNKCJA FILTROWANIA =============
  
  // Filtruj undefined wartości przed zapisem do Firebase
  private static cleanFirestoreData(data: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    )
  }

  // ============= REJESTRACJA I LOGOWANIE =============

  // Rejestracja nowego użytkownika
  static async registerUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Aktualizuj profil w Firebase Auth
      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      // Utwórz profil użytkownika w Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || null,
        photoURL: null,
        role: 'customer',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDocRef, this.cleanFirestoreData(userData))

      // Utwórz pusty profil użytkownika
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        firstName: displayName?.split(' ')[0] || '',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        phone: '',
        dateOfBirth: '',
        preferences: {
          newsletter: true,
          smsNotifications: false,
          emailNotifications: true,
          orderNotifications: true,
          marketingEmails: false
        },
        totalOrders: 0,
        totalSpent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const profileDocRef = doc(db, 'userProfiles', firebaseUser.uid)
      await setDoc(profileDocRef, this.cleanFirestoreData(userProfile))

      return userData
    } catch (error: any) {
      console.error('Error registering user:', error)
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Ten email jest już używany')
        case 'auth/weak-password':
          throw new Error('Hasło jest zbyt słabe')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        default:
          throw new Error('Nie udało się utworzyć konta')
      }
    }
  }

  // Logowanie użytkownika
  static async loginUser(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      const userData = await this.getUserData(firebaseUser.uid)
      if (!userData) {
        throw new Error('Nie znaleziono danych użytkownika')
      }

      // Sprawdź czy konto jest aktywne
      if (userData.isActive === false) {
        await signOut(auth) // Wyloguj nieaktywnego użytkownika
        throw new Error('Konto zostało dezaktywowane. Skontaktuj się z obsługą.')
      }

      return userData
    } catch (error: any) {
      console.error('Error logging in:', error)
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Nie znaleziono użytkownika z tym emailem')
        case 'auth/wrong-password':
          throw new Error('Nieprawidłowe hasło')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        case 'auth/too-many-requests':
          throw new Error('Zbyt dużo prób logowania. Spróbuj później')
        default:
          if (error.message.includes('dezaktywowane')) {
            throw error // Przekaż błąd dezaktywacji
          }
          throw new Error('Nie udało się zalogować')
      }
    }
  }

  // Wylogowanie
  static async logoutUser(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error)
      throw new Error('Nie udało się wylogować')
    }
  }

  // Reset hasła
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Error sending password reset email:', error)
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Nie znaleziono użytkownika z tym emailem')
        case 'auth/invalid-email':
          throw new Error('Nieprawidłowy format email')
        default:
          throw new Error('Nie udało się wysłać emaila resetującego')
      }
    }
  }

  // ============= POBIERANIE DANYCH =============

  // Pobierz dane użytkownika z Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', uid)
      const snapshot = await getDoc(userDocRef)
      if (!snapshot.exists()) return null

      return {
        uid: snapshot.id,
        ...snapshot.data()
      } as User
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  // Pobierz profil użytkownika
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profileDocRef = doc(db, 'userProfiles', uid)
      const snapshot = await getDoc(profileDocRef)
      if (!snapshot.exists()) return null

      return {
        uid: snapshot.id,
        ...snapshot.data()
      } as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Pobierz pełne dane użytkownika (User + UserProfile)
  static async getCompleteUserData(uid: string): Promise<{
    user: User | null
    profile: UserProfile | null
  }> {
    try {
      const [user, profile] = await Promise.all([
        this.getUserData(uid),
        this.getUserProfile(uid)
      ])

      return { user, profile }
    } catch (error) {
      console.error('Error fetching complete user data:', error)
      return { user: null, profile: null }
    }
  }

  // ============= AKTUALIZACJA DANYCH =============

  // Aktualizuj profil użytkownika
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const profileDocRef = doc(db, 'userProfiles', uid)
      
      // Filtruj undefined wartości
      const cleanUpdates = this.cleanFirestoreData(updates)
      
      await updateDoc(profileDocRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      })

      // Jeśli aktualizujemy imię/nazwisko, zaktualizuj też displayName
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const profile = await this.getUserProfile(uid)
        if (profile) {
          const displayName = `${profile.firstName || updates.firstName || ''} ${profile.lastName || updates.lastName || ''}`.trim()
          
          if (displayName) {
            await this.updateUserData(uid, { displayName })

            const currentUser = auth.currentUser
            if (currentUser && currentUser.uid === uid) {
              await updateProfile(currentUser, { displayName })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Nie udało się zaktualizować profilu')
    }
  }

  // Aktualizuj dane użytkownika
  static async updateUserData(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid)
      
      // Filtruj undefined wartości
      const cleanUpdates = this.cleanFirestoreData(updates)
      
      await updateDoc(userDocRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating user data:', error)
      throw new Error('Nie udało się zaktualizować danych użytkownika')
    }
  }

  // Aktualizuj preferencje użytkownika
  static async updateUserPreferences(
    uid: string, 
    preferences: Partial<UserProfile['preferences']>
  ): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile(uid)
      if (!currentProfile) {
        throw new Error('Nie znaleziono profilu użytkownika')
      }

      const updatedPreferences = {
        ...currentProfile.preferences,
        ...preferences
      }

      await this.updateUserProfile(uid, { preferences: updatedPreferences })
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw new Error('Nie udało się zaktualizować preferencji')
    }
  }

  // ============= ZARZĄDZANIE ROLAMI =============

  // Sprawdź czy użytkownik jest adminem
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userData = await this.getUserData(uid)
      return userData?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Utwórz pierwszego admina
  static async createAdminUser(
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      if (displayName) {
        await updateProfile(firebaseUser, { displayName })
      }

      const adminData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName || 'Administrator',
        photoURL: null,
        role: 'admin',
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid)
      await setDoc(userDocRef, this.cleanFirestoreData(adminData))

      // Utwórz profil administratora
      const adminProfile: UserProfile = {
        uid: firebaseUser.uid,
        firstName: displayName?.split(' ')[0] || 'Administrator',
        lastName: displayName?.split(' ').slice(1).join(' ') || '',
        preferences: {
          newsletter: false,
          smsNotifications: true,
          emailNotifications: true,
          orderNotifications: true,
          marketingEmails: false
        },
        totalOrders: 0,
        totalSpent: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const profileDocRef = doc(db, 'userProfiles', firebaseUser.uid)
      await setDoc(profileDocRef, this.cleanFirestoreData(adminProfile))

      return adminData
    } catch (error) {
      console.error('Error creating admin:', error)
      throw new Error('Nie udało się utworzyć konta administratora')
    }
  }

  // ============= ZARZĄDZANIE ADRESAMI =============

  // Pobierz adresy użytkownika
  static async getUserAddresses(uid: string): Promise<Address[]> {
    try {
      const addressesCol = collection(db, 'addresses')
      const q = query(
        addressesCol, 
        where('userId', '==', uid),
        where('isActive', '!=', false), // pobierz tylko aktywne adresy
        orderBy('isDefault', 'desc'), // domyślne na górze
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Address))
    } catch (error) {
      console.error('Error fetching user addresses:', error)
      // Fallback bez sortowania dla przypadku braku indeksu
      try {
        const addressesCol = collection(db, 'addresses')
        const fallbackQuery = query(addressesCol, where('userId', '==', uid))
        const snapshot = await getDocs(fallbackQuery)
        
        const addresses = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as Address)).filter(addr => addr.isActive !== false)
        
        // Sortuj lokalnie
        return addresses.sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        })
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError)
        return []
      }
    }
  }

  // Dodaj adres użytkownika
  static async addUserAddress(
    addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      // Walidacja danych
      this.validateAddressData(addressData)

      const addressesCol = collection(db, 'addresses')

      // Jeśli to pierwszy adres lub ma być domyślny, ustaw inne jako niedomyślne
      if (addressData.isDefault) {
        await this.clearDefaultAddresses(addressData.userId, addressData.type)
      } else {
        // Sprawdź czy użytkownik ma już jakiś adres tego typu
        const existingAddresses = await this.getUserAddressesByType(addressData.userId, addressData.type)
        if (existingAddresses.length === 0) {
          // Jeśli to pierwszy adres tego typu, ustaw jako domyślny
          addressData = { ...addressData, isDefault: true }
        }
      }

      // KLUCZOWA ZMIANA: Filtruj undefined wartości przed zapisem
      const cleanAddressData = this.cleanFirestoreData(addressData)

      const newDocRef = doc(addressesCol)
      await setDoc(newDocRef, {
        ...cleanAddressData,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      
      return newDocRef.id
    } catch (error) {
      console.error('Error adding address:', error)
      throw new Error('Nie udało się dodać adresu')
    }
  }

  // Aktualizuj adres użytkownika
  static async updateUserAddress(addressId: string, updates: Partial<Address>): Promise<void> {
    try {
      // Pobierz obecny adres
      const currentAddress = await this.getAddressById(addressId)
      if (!currentAddress) {
        throw new Error('Nie znaleziono adresu')
      }

      // Jeśli ustawiamy jako domyślny, wyczyść inne domyślne
      if (updates.isDefault === true) {
        await this.clearDefaultAddresses(currentAddress.userId, currentAddress.type)
      }

      const addressDocRef = doc(db, 'addresses', addressId)
      
      // Filtruj undefined wartości
      const cleanUpdates = this.cleanFirestoreData(updates)
      
      await updateDoc(addressDocRef, {
        ...cleanUpdates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating address:', error)
      throw new Error('Nie udało się zaktualizować adresu')
    }
  }

  // Usuń adres użytkownika (soft delete)
  static async deleteUserAddress(addressId: string): Promise<void> {
    try {
      const addressDocRef = doc(db, 'addresses', addressId)
      
      // Soft delete - ustaw jako nieaktywny
      await updateDoc(addressDocRef, {
        isActive: false,
        isDefault: false,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error deleting address:', error)
      throw new Error('Nie udało się usunąć adresu')
    }
  }

  // Usuń adres permanentnie (hard delete)
  static async permanentlyDeleteAddress(addressId: string): Promise<void> {
    try {
      const addressDocRef = doc(db, 'addresses', addressId)
      await deleteDoc(addressDocRef)
    } catch (error) {
      console.error('Error permanently deleting address:', error)
      throw new Error('Nie udało się trwale usunąć adresu')
    }
  }

  // ============= POMOCNICZE FUNKCJE ADRESÓW =============

  // Pobierz adres po ID
  static async getAddressById(addressId: string): Promise<Address | null> {
    try {
      const addressDoc = doc(db, 'addresses', addressId)
      const snapshot = await getDoc(addressDoc)
      
      if (!snapshot.exists()) return null
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Address
    } catch (error) {
      console.error('Error fetching address by ID:', error)
      return null
    }
  }

  // Pobierz adresy określonego typu
  static async getUserAddressesByType(userId: string, type: Address['type']): Promise<Address[]> {
    try {
      const allAddresses = await this.getUserAddresses(userId)
      return allAddresses.filter(addr => addr.type === type || addr.type === 'both')
    } catch (error) {
      console.error('Error fetching addresses by type:', error)
      return []
    }
  }

  // Pobierz domyślny adres użytkownika
  static async getDefaultAddress(uid: string, type: 'shipping' | 'billing'): Promise<Address | null> {
    try {
      const addresses = await this.getUserAddressesByType(uid, type)
      return addresses.find(a => a.isDefault) || addresses[0] || null
    } catch (error) {
      console.error('Error fetching default address:', error)
      return null
    }
  }

  // Ustaw adres jako domyślny
  static async setDefaultAddress(addressId: string, userId: string, type: 'shipping' | 'billing'): Promise<void> {
    try {
      // Wyczyść inne domyślne adresy tego typu
      await this.clearDefaultAddresses(userId, type)
      
      // Ustaw ten adres jako domyślny
      await this.updateUserAddress(addressId, { isDefault: true })
    } catch (error) {
      console.error('Error setting default address:', error)
      throw new Error('Nie udało się ustawić domyślnego adresu')
    }
  }

  // Wyczyść domyślne adresy danego typu
  private static async clearDefaultAddresses(userId: string, type: Address['type']): Promise<void> {
    try {
      const addresses = await this.getUserAddressesByType(userId, type)
      const defaultAddresses = addresses.filter(a => a.isDefault)

      const updatePromises = defaultAddresses.map(address =>
        this.updateUserAddress(address.id, { isDefault: false })
      )

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error clearing default addresses:', error)
      // Nie rzucaj błędem - to operacja pomocnicza
    }
  }

  // Walidacja danych adresowych
  private static validateAddressData(addressData: Partial<Address>): void {
    const requiredFields = ['firstName', 'lastName', 'street', 'houseNumber', 'postalCode', 'city', 'country']
    
    for (const field of requiredFields) {
      if (!addressData[field as keyof Address]) {
        throw new Error(`Pole ${field} jest wymagane`)
      }
    }

    // Walidacja kodu pocztowego (format polski)
    if (addressData.country === 'Poland' || addressData.country === 'Polska') {
      const postalCodeRegex = /^\d{2}-\d{3}$/
      if (addressData.postalCode && !postalCodeRegex.test(addressData.postalCode)) {
        throw new Error('Kod pocztowy musi być w formacie XX-XXX')
      }
    }
  }

  // ============= STATYSTYKI I ADMINISTRACJA =============

  // Hook do śledzenia stanu autoryzacji
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Sprawdź czy email już istnieje
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const usersCol = collection(db, 'users')
      const q = query(usersCol, where('email', '==', email))
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false
    }
  }

  // Pobierz statystyki użytkowników (dla admina)
  static async getUserStats(): Promise<{
    totalUsers: number
    totalCustomers: number
    totalAdmins: number
    activeUsers: number
    recentUsers: User[]
  }> {
    try {
      const usersCol = collection(db, 'users')
      const snapshot = await getDocs(usersCol)
      
      const users = snapshot.docs.map(d => ({
        uid: d.id,
        ...d.data()
      } as User))

      const customers = users.filter(u => u.role === 'customer')
      const admins = users.filter(u => u.role === 'admin')
      const activeUsers = users.filter(u => u.isActive !== false)

      const recentUsers = users
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 5)

      return {
        totalUsers: users.length,
        totalCustomers: customers.length,
        totalAdmins: admins.length,
        activeUsers: activeUsers.length,
        recentUsers
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalUsers: 0,
        totalCustomers: 0,
        totalAdmins: 0,
        activeUsers: 0,
        recentUsers: []
      }
    }
  }

  // Dezaktywuj/aktywuj konto użytkownika (tylko admin)
  static async toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      await this.updateUserData(uid, { isActive })
    } catch (error) {
      console.error('Error toggling user status:', error)
      throw new Error('Nie udało się zmienić statusu użytkownika')
    }
  }

  // Pobierz ostatnie logowania (wymaga implementacji w logowaniu)
  static async getUserActivity(uid: string, limitCount: number = 10): Promise<any[]> {
    // To można rozszerzyć o śledzenie aktywności użytkownika
    // Na razie zwraca pusty array
    return []
  }
}