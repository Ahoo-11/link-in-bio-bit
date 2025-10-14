;; LinkChain Tips Smart Contract
;; Handles tip transfers and earnings tracking for creators

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-transfer-failed (err u103))
(define-constant err-not-authorized (err u104))

;; Data Variables
(define-data-var platform-fee-percent uint u2) ;; 2% platform fee

;; Data Maps
;; Track total earnings per creator
(define-map creator-earnings principal uint)

;; Track individual tips: creator -> list of tip IDs
(define-map tip-history 
  { creator: principal, tip-id: uint }
  { 
    amount: uint,
    sender: principal,
    timestamp: uint,
    message: (optional (string-utf8 280)),
    anonymous: bool
  }
)

;; Track tip count per creator
(define-map creator-tip-count principal uint)

;; Track total tips sent by a user
(define-map sender-total principal uint)

;; Read-only functions

;; Get total earnings for a creator
(define-read-only (get-creator-earnings (creator principal))
  (default-to u0 (map-get? creator-earnings creator))
)

;; Get tip count for a creator
(define-read-only (get-tip-count (creator principal))
  (default-to u0 (map-get? creator-tip-count creator))
)

;; Get specific tip details
(define-read-only (get-tip-details (creator principal) (tip-id uint))
  (map-get? tip-history { creator: creator, tip-id: tip-id })
)

;; Get total amount sent by a sender
(define-read-only (get-sender-total (sender principal))
  (default-to u0 (map-get? sender-total sender))
)

;; Get platform fee percentage
(define-read-only (get-platform-fee)
  (var-get platform-fee-percent)
)

;; Calculate platform fee for an amount
(define-read-only (calculate-fee (amount uint))
  (/ (* amount (var-get platform-fee-percent)) u100)
)

;; Public functions

;; Send a tip to a creator
(define-public (send-tip 
  (creator principal) 
  (amount uint) 
  (message (optional (string-utf8 280)))
  (anonymous bool)
)
  (let
    (
      (tip-id (+ (get-tip-count creator) u1))
      (platform-fee (calculate-fee amount))
      (creator-amount (- amount platform-fee))
    )
    ;; Validate amount
    (asserts! (> amount u0) err-invalid-amount)
    
    ;; Transfer STX to creator (minus platform fee)
    (match (stx-transfer? creator-amount tx-sender creator)
      success
        (begin
          ;; Transfer platform fee to contract owner
          (if (> platform-fee u0)
            (unwrap! (stx-transfer? platform-fee tx-sender contract-owner) err-transfer-failed)
            true
          )
          
          ;; Update creator earnings
          (map-set creator-earnings 
            creator 
            (+ (get-creator-earnings creator) creator-amount)
          )
          
          ;; Update tip count
          (map-set creator-tip-count creator tip-id)
          
          ;; Store tip details
          (map-set tip-history
            { creator: creator, tip-id: tip-id }
            {
              amount: creator-amount,
              sender: tx-sender,
              timestamp: block-height,
              message: message,
              anonymous: anonymous
            }
          )
          
          ;; Update sender total
          (map-set sender-total
            tx-sender
            (+ (get-sender-total tx-sender) amount)
          )
          
          (ok { tip-id: tip-id, amount: creator-amount, fee: platform-fee })
        )
      error (err err-transfer-failed)
    )
  )
)

;; Send anonymous tip
(define-public (send-anonymous-tip 
  (creator principal) 
  (amount uint)
)
  (send-tip creator amount none true)
)

;; Admin functions

;; Update platform fee (only contract owner)
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= new-fee u10) err-invalid-amount) ;; Max 10% fee
    (ok (var-set platform-fee-percent new-fee))
  )
)

;; Withdraw accumulated fees (only contract owner)
(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (<= amount (stx-get-balance (as-contract tx-sender))) err-insufficient-balance)
    (as-contract (stx-transfer? amount tx-sender contract-owner))
  )
)

;; Initialize contract
(begin
  (print { 
    event: "contract-deployed", 
    owner: contract-owner,
    platform-fee: (var-get platform-fee-percent)
  })
)
