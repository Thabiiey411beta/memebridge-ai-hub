# Axiom Bridge Smart Contracts

A comprehensive, mathematically-precise smart contract suite for secure cross-chain bridging, built on Solana with Anchor framework.

## Architecture Overview

The Axiom Bridge consists of five specialized programs working together:

### 1. Bridge Vault (`axiom-bridge-vault`)
**Purpose**: Secure token locking and releasing mechanism
- **Mathematical Safety**: Overflow-protected arithmetic for all token operations
- **Security Features**: Multi-signature controlled releases, emergency pause functionality
- **Key Functions**:
  - `lock_tokens()`: Securely lock tokens for bridging
  - `release_tokens()`: Release tokens to destination with verification
  - `emergency_pause()`: Halt operations in case of security issues

### 2. Bridge Escrow (`axiom-bridge-escrow`)
**Purpose**: Cross-chain transfer escrow with dispute resolution
- **Mathematical Safety**: Precise fee calculations with basis points (BPS) arithmetic
- **Security Features**: Time-locked escrows, multi-party dispute resolution
- **Key Functions**:
  - `create_escrow()`: Create secure escrow for cross-chain transfer
  - `complete_escrow()`: Complete transfer with proof verification
  - `dispute_escrow()`: Initiate dispute resolution process

### 3. Fee Calculator (`axiom-fee-calculator`)
**Purpose**: Dynamic fee calculation with mathematical precision
- **Mathematical Safety**: All calculations use checked arithmetic to prevent overflow
- **Dynamic Pricing**: Volume-based and risk-adjusted fee multipliers
- **Formula**: `total_fee = base_fee × volume_multiplier × risk_multiplier`
- **Key Functions**:
  - `calculate_fee()`: Compute precise fees for transfers
  - `update_base_fee()`: Governance-controlled fee updates
  - `adjust_multipliers()`: Dynamic fee adjustment based on network conditions

### 4. Security Validator (`axiom-security-validator`)
**Purpose**: Comprehensive security validation and risk assessment
- **Mathematical Safety**: Statistical analysis for pattern detection
- **Risk Assessment**: Multi-factor risk scoring algorithm
- **Security Features**: Suspicious pattern detection, volume limits, blacklist management
- **Key Functions**:
  - `validate_transfer()`: Comprehensive transfer validation
  - `assess_risk()`: Calculate risk scores for transactions
  - `update_patterns()`: Maintain suspicious pattern database

### 5. Governance (`axiom-governance`)
**Purpose**: Multi-signature governance for protocol parameters
- **Security Features**: Threshold-based multi-signature control
- **Proposal System**: Time-locked proposal execution with voting
- **Key Functions**:
  - `create_proposal()`: Create governance proposals
  - `vote_proposal()`: Multi-signature voting mechanism
  - `execute_proposal()`: Execute approved proposals with delay

### 6. Bridge Orchestrator (`axiom-bridge-orchestrator`)
**Purpose**: Main coordination contract integrating all components
- **Integration**: Orchestrates all bridge operations
- **Cross-Program Calls**: Secure communication between programs
- **Key Functions**:
  - `initiate_transfer()`: Start cross-chain transfer
  - `complete_transfer()`: Finalize transfer with verification
  - `emergency_pause()`: System-wide emergency controls

## Mathematical Precision

All contracts implement mathematically precise calculations:

### Fee Calculations
```rust
// BPS (Basis Points) arithmetic - 1 BPS = 0.01%
base_fee = (amount × base_fee_bps) / 10000

// Dynamic multipliers with overflow protection
total_fee = base_fee × volume_multiplier × risk_multiplier / (10000 × 10000)
```

### Risk Assessment
```rust
// Multi-factor risk scoring
risk_score = base_risk + volume_risk + pattern_risk + velocity_risk

// Risk multiplier calculation
risk_multiplier = 10000 + (risk_score × risk_sensitivity)
```

### Volume Controls
```rust
// Daily volume tracking with time-based resets
if current_time - day_start > 86400 {
    current_daily_volume = 0
    day_start = current_time
}
```

## Security Features

### Multi-Layer Validation
1. **Input Validation**: All inputs checked for bounds and format
2. **Mathematical Safety**: Checked arithmetic prevents overflow/underflow
3. **Access Control**: Multi-signature governance for critical operations
4. **Time Locks**: Delayed execution for high-risk operations
5. **Emergency Controls**: Pause functionality for security incidents

### Pattern Detection
- **Velocity Analysis**: Rapid transfer detection
- **Volume Thresholds**: Large transfer monitoring
- **Address Blacklisting**: Malicious address blocking
- **Chain Analysis**: Cross-chain pattern recognition

## Deployment

### Prerequisites
- Solana CLI 1.18+
- Anchor Framework 0.29+
- Node.js 18+
- Yarn

### Build & Deploy
```bash
# Build all programs
anchor build

# Deploy to localnet
anchor deploy

# Run tests
anchor test
```

### Program IDs
- Bridge Vault: `AX1oMBridgeVaultXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Bridge Escrow: `AX1oMBridgeEscrowXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Fee Calculator: `AX1oMFeeCalculatorXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Security Validator: `AX1oMSecurityValidatorXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Governance: `AX1oMGovernanceXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Bridge Orchestrator: `AX1oMBridgeOrchestratorXXXXXXXXXXXXXXXXXXXXXXXXX`

## Testing

Comprehensive test suite covering:
- Unit tests for mathematical functions
- Integration tests for cross-program calls
- Security tests for edge cases
- Governance tests for multi-signature flows

```bash
# Run all tests
anchor test

# Run specific test
anchor test -- --test test_fee_calculations
```

## API Reference

### Bridge Orchestrator Interface

```rust
// Initialize bridge
initialize_bridge(bridge_config: BridgeConfig)

// Initiate transfer
initiate_transfer(amount: u64, destination_chain: String, recipient: Pubkey)

// Complete transfer
complete_transfer(transfer_id: u32, proof_data: Vec<u8>)

// Emergency controls
emergency_pause(pause: bool)
```

### Fee Calculator Interface

```rust
// Calculate fees
calculate_fee(amount: u64, total_volume: u64, risk_score: u16) -> FeeInfo

// Update base fee (governance only)
update_base_fee(new_fee_bps: u16)
```

## Security Audit

All contracts have been designed with security-first principles:
- ✅ Overflow protection on all arithmetic
- ✅ Access control with multi-signature governance
- ✅ Time locks on critical operations
- ✅ Emergency pause functionality
- ✅ Comprehensive input validation
- ✅ Event emission for transparency

## License

Copyright 2024 Axiom Bridge Protocol. All rights reserved.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.